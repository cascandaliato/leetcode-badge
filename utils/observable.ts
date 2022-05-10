import axios from "axios";
import { Observable } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from "rxjs/operators";

interface ApiAnswer {
  error: string;
}

const toValidUsernameObservable = (
  observable: Observable<string>,
  onError: (e: string) => void
): Observable<string> =>
  observable.pipe(
    filter((value) => !!value),
    distinctUntilChanged(),
    debounceTime(500),
    switchMap(
      (username) =>
        new Observable<string>((observer) => {
          const source = axios.CancelToken.source();
          axios
            .get<ApiAnswer>(`/api/users/${username}`, {
              cancelToken: source.token,
            })
            .then(({ data: { error: e } }) => {
              if (e) {
                onError(e);
              }
                observer.next(username);
            })
            .catch((thrown) => {
              if (!axios.isCancel(thrown)) {
                onError("Couldn't retrieve user");
              }
            });

          return () => source.cancel();
        })
    )
  );

export default toValidUsernameObservable;
