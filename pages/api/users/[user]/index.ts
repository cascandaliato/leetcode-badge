import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

interface LeetCodeCount {
  difficulty: string;
  count: number;
}

interface LeetCodeResponse {
  data: {
    data: {
      allQuestionsCount: LeetCodeCount[];
      filteredQuestions: LeetCodeCount[];
      matchedUser: {
        profile: { realName: string; userAvatar: string; ranking: number };
        submitStats: { acSubmissionNum: LeetCodeCount[] };
      };
      userContestRanking: { rating: string; topPercentage: string };
    };
  };
}

interface Output {
  realName: string;
  avatarUrl: string;
  ranking: number | string;
  rating: number | string;
  ratingQuantile: string;
  solved: number | string;
  solvedOverTotal: string;
  solvedPercentage: string;
  error: null | string;
}

const query = (user: string) =>
  `{
    "variables": { "username" : "${user}" },
    "query": "query getUserProfile($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { profile { realName userAvatar starRating ranking } submitStats { acSubmissionNum { difficulty count } } } userContestRanking(username: $username)  {rating topPercentage} }"
}`;

const genericErrorMessage =
  "error: reach out to github.com/cascandaliato/leetcode-badge";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { user },
  } = req;

  let output: Output;

  try {
    const {
      data: { data },
    }: LeetCodeResponse = await axios.post(
      "https://leetcode.com/graphql",
      query(user as string),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    if (!data.matchedUser) throw new Error("User not found");

    const {
      realName,
      userAvatar: avatarUrl,
      ranking,
    } = data.matchedUser.profile;

    const solved = data.matchedUser.submitStats.acSubmissionNum.filter(
      ({ difficulty }) => difficulty === "All"
    )[0].count;

    const total = data.allQuestionsCount.filter(
      ({ difficulty }) => difficulty === "All"
    )[0].count;

    const rating = data.userContestRanking
      ? Math.round(parseFloat(data.userContestRanking.rating))
      : "N/A";

    const topPercentage = data.userContestRanking
      ? parseFloat(data.userContestRanking.topPercentage)
      : "N/A";

    const ratingQuantile =
      topPercentage === "N/A" || rating === "N/A"
        ? "N/A"
        : `${rating} (top ${topPercentage}%)`;

    output = {
      realName,
      avatarUrl,
      ranking,
      rating,
      solved,
      ratingQuantile,
      solvedOverTotal: `${solved}/${total}`,
      solvedPercentage: `${((solved / total) * 100).toFixed(1)}%`,
      error: null,
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
