// キャッシュタグ定義
export const TAG = {
  EXERCISES: "exercises",
  WORKOUTS_BY_USER: (id: string) => `workouts:user:${id}`,
  VOLUME_WEEK: (id: string) => `volumes:user:${id}:week`,
  VOLUME_MONTH: (id: string) => `volumes:user:${id}:month`,
} as const;
