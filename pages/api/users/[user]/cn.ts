import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "path";

interface LeetCodeCount {
  difficulty: string;
  count: number;
}

interface processResponse {
  data: {
    data: {
      userProfileUserQuestionProgress: {
        numAcceptedQuestions: LeetCodeCount[];
        numFailedQuestions: LeetCodeCount[];
        numUntouchedQuestions: LeetCodeCount[];
      };
    };
  };
}

interface profileResponse {
  data: {
    data: {
      userProfilePublicProfile: {
        siteRanking: number;
        profile: { userSlug: string; realName: string; userAvatar: string };
      };
    };
  };
}

interface contestResponse {
  data: {
    data: {
      userContestRanking: { rating: number; topPercentage: string };
    };
  };
}

interface Output {
  realName: string;
  avatarUrl: string;
  ranking: number | string;
  rating: number | string;
  solved: number | string;
  solvedOverTotal: string;
  solvedPercentage: string;
  error: null | string;
  ratingQuantile: string;
}

const queryProfile = (user: string) =>
  `{
    "variables": { "userSlug" : "${user}" },
    "query": "query userProfilePublicProfile($userSlug: String!) { userProfilePublicProfile(userSlug: $userSlug) { siteRanking profile { userSlug realName userAvatar} }}"
}`;

const queryProcess = (user: string) =>
  `{"variables": { "userSlug" : "${user}" },
    "query": "query userQuestionProgress($userSlug: String!) { userProfileUserQuestionProgress(userSlug: $userSlug) { numAcceptedQuestions { difficulty count } numFailedQuestions { difficulty count }numUntouchedQuestions { difficulty count } }}"
}`;

const queryRating = (user: string) =>
  `{"variables": { "userSlug" : "${user}" }, 
 "query": "query userContestRankingInfo($userSlug: String!) { userContestRanking(userSlug: $userSlug) {rating topPercentage}}" 
}`;

const genericErrorMessage =
  "error: reach out to github.com/cascandaliato/leetcode-badge";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { user },
  } = req;

  let output: Output;

  try {
    const userprofile: profileResponse = await axios.post(
      "https://leetcode.cn/graphql",
      queryProfile(user as string),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    if (!userprofile.data.data.userProfilePublicProfile)
      throw new Error("User not found");

    const processResponse: processResponse = await axios.post(
      "https://leetcode.cn/graphql",
      queryProcess(user as string),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const usercontestres: contestResponse = await axios.post(
      "https://leetcode.cn/graphql/noj-go",
      queryRating(user as string),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const realName =
      userprofile.data.data.userProfilePublicProfile.profile.realName;
    const avatarUrl =
      userprofile.data.data.userProfilePublicProfile.profile.userAvatar;
    const ranking = userprofile.data.data.userProfilePublicProfile.siteRanking;

    const solved = processResponse.data.data.userProfileUserQuestionProgress.numAcceptedQuestions.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const failed = processResponse.data.data.userProfileUserQuestionProgress.numFailedQuestions.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const untouched = processResponse.data.data.userProfileUserQuestionProgress.numUntouchedQuestions.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const total = solved + failed + untouched;

    const rating = usercontestres.data.data.userContestRanking
      ? Math.round(usercontestres.data.data.userContestRanking.rating)
      : "N/A";

    const topPercentage = usercontestres.data.data.userContestRanking
      ? parseFloat(usercontestres.data.data.userContestRanking.topPercentage)
      : "N/A";

    const ratingQuantile =
      rating === "N/A" || topPercentage === "N/A"
        ? "N/A"
        : `${rating} (top ${topPercentage}%)`;

    output = {
      realName,
      avatarUrl,
      ranking,
      rating: rating,
      solved,
      solvedOverTotal: `${solved}/${total}`,
      solvedPercentage: `${((solved / total) * 100).toFixed(1)}%`,
      error: null,
      ratingQuantile,
    };
  } catch (e) {
    let err = (e as Error).message;
    output = {
      realName: err,
      avatarUrl: err,
      ranking: err,
      rating: err,
      solved: err,
      solvedOverTotal: err,
      solvedPercentage: err,
      error: err,
      ratingQuantile: err,
    };
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(output);
};
