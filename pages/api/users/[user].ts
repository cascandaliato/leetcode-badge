import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface LeetCodeCount {
  difficulty: string;
  count: number;
}

interface LeetCodeResponse {
  data: {
    data: {
      allQuestionsCount: LeetCodeCount[];
      matchedUser: {
        profile: { ranking: number };
        submitStats: {
          acSubmissionNum: LeetCodeCount[];
        };
      };
    };
  };
}

interface Output {
  ranking: number | string;
  solved: number | string;
  solvedOverTotal: string;
  solvedPercentage: string;
  error: null | string;
}

const query = (user: string) =>
  `{
    "operationName": "getUserProfile",
    "variables": { "username" : "${user}" },
    "query": "query getUserProfile($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { profile { starRating ranking } submitStats { acSubmissionNum { difficulty count } } } }"
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

    const ranking = data.matchedUser.profile.ranking;

    const solved = data.matchedUser.submitStats.acSubmissionNum.filter(
      ({ difficulty }) => difficulty === "All"
    )[0].count;

    const total = data.allQuestionsCount.filter(
      ({ difficulty }) => difficulty === "All"
    )[0].count;

    output = {
      ranking,
      solved,
      solvedOverTotal: `${solved}/${total}`,
      solvedPercentage: `${((solved / total) * 100).toFixed(1)}%`,
      error: null,
    };
  } catch ({ message }) {
    output = {
      ranking: genericErrorMessage,
      solved: genericErrorMessage,
      solvedOverTotal: genericErrorMessage,
      solvedPercentage: genericErrorMessage,
      error: message,
    };
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(output);
};
