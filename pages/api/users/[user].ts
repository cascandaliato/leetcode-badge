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
      matchedUser: {
        profile: { realName: string; userAvatar: string; ranking: number };
        submitStats: { acSubmissionNum: LeetCodeCount[] };
      };
      userContestRanking: { rating: string };
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
}


const query = (user: string) =>
  `{
    "operationName": "getUserProfile",
    "variables": { "username" : "${user}" },
    "query": "query getUserProfile($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { profile { realName userAvatar starRating ranking } submitStats { acSubmissionNum { difficulty count } } } userContestRanking(username: $username)  {rating} }"
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

    const rating = Math.round(parseFloat(data.userContestRanking.rating));

    output = {
      realName,
      avatarUrl,
      ranking,
      rating,
      solved,
      solvedOverTotal: `${solved}/${total}`,
      solvedPercentage: `${((solved / total) * 100).toFixed(1)}%`,
      error: null,
    };
  } catch ({ message }) {
    output = {
      realName: genericErrorMessage,
      avatarUrl: genericErrorMessage,
      ranking: genericErrorMessage,
      rating: genericErrorMessage,
      solved: genericErrorMessage,
      solvedOverTotal: genericErrorMessage,
      solvedPercentage: genericErrorMessage,
      error: message,
    };
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(output);
  
  console.log(output);
};
