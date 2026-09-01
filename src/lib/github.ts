import "server-only";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

const CONTRIBUTIONS_QUERY = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

interface ContributionCalendarResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: { date: string; contributionCount: number }[];
          }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
}

/**
 * 앱 소유의 단일 GitHub PAT로 특정 사용자명의 공개 컨트리뷰션 캘린더를 조회한다.
 * 대상 계정이 GitHub 설정에서 "Include private contributions on my profile"을
 * 켜둔 경우, 그 계정의 비공개 기여 횟수도 (리포지토리명 노출 없이) 함께 포함된다 —
 * 이는 조회자의 토큰과 무관하게 대상 계정 자체의 프로필 설정에 달려있다.
 */
export async function fetchContributionCounts(
  username: string,
  from: Date,
  to: Date,
): Promise<Map<string, number>> {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    throw new Error("GITHUB_PAT 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login: username, from: from.toISOString(), to: to.toISOString() },
    }),
    cache: "no-store",
  });

  const json: ContributionCalendarResponse = await res.json();

  if (!res.ok || json.errors || !json.data?.user) {
    const message = json.errors?.[0]?.message ?? `GitHub API 오류 (${res.status})`;
    throw new Error(`"${username}" 컨트리뷰션 조회 실패: ${message}`);
  }

  const counts = new Map<string, number>();
  for (const week of json.data.user.contributionsCollection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      counts.set(day.date, day.contributionCount);
    }
  }
  return counts;
}
