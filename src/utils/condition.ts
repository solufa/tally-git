// https://zenn.dev/shoalwave/articles/527a539d3c7a01
/**
 * union 型の差分を取得する（string, number, symbol のみ対応）
 */
type Diff<T extends keyof never, U extends T> = ({ [P in T]: P } & { [P in U]: never } & {
  [x: keyof never]: never;
})[T];

/**
 * 条件分岐の型
 * case(mach, callback) で条件分岐を追加
 * else(callback) でデフォルトの処理を追加
 * done で結果を取得（型の網羅性を検査）
 */
type Condition<T extends keyof never, R> = [T] extends [never] ? { done: R } : ConditionItem<T, R>;

type ConditionItem<T extends keyof never, R> = {
  case: <U extends T, A>(
    match: U | U[],
    callback: (matched: U) => A,
  ) => Condition<Diff<T, U>, R | A>;
  else: <A>(callback: (matched: T) => A) => R | A;
};

/**
 * 型安全に Array.includes をするための関数
 * @param array 配列
 * @param input 比較対象（配列の型に含まれている必要はない）
 * @returns boolean
 */
const includes = <T extends ReadonlyArray<unknown>>(
  array: T,
  input: unknown,
): input is T[number] => {
  return array.includes(input);
};

/**
 * match しない場合に true を返す
 * （Diff 型を返したいので判定逆転させている）
 */
const isUnmatch = <T extends keyof never, U extends T>(
  val: T,
  match: U | U[],
): val is Diff<T, U> => {
  return Array.isArray(match) ? !includes(match, val) : val !== match;
};

/**
 *  一度 match した後は実行せずに結果を引き継ぐ
 */
const matchedCondition = <T extends keyof never, R>(result: R): Condition<T, R> => {
  const conditionItem: ConditionItem<T, R> = {
    case: <U extends T, A>(_: U | U[], __: (_: U) => A) =>
      matchedCondition<Diff<T, U>, R | A>(result),
    else: <A>(_: (_: T) => A) => result,
  };

  return { ...conditionItem, ...{ done: result } };
};

/**
 * メインロジック
 * （result を入力できないように condition を噛ましている）
 */
const conditionBody = <T extends keyof never, R>(val: T, result: R): Condition<T, R> => {
  const conditionItem: ConditionItem<T, R> = {
    case: <U extends T, A>(match: U | U[], callback: (matched: U) => A) =>
      isUnmatch(val, match)
        ? conditionBody<Diff<T, U>, R | A>(val, result)
        : matchedCondition<Diff<T, U>, R | A>(callback(val as U)),
    else: <A>(callback: (matched: T) => A) => callback(val),
  };

  return { ...conditionItem, ...{ done: result } };
};

/**
 *  switch 文の代替として宣言的かつ型安全に条件分岐ができる関数
 *  最後に done プロパティを参照することで返り値を取得するとともに
 *  型の網羅性をチェックできる。例↓
 *    condition(val)
 *      .case('val1', () => '1' as const)
 *      .case(['val2', 'val3'], (val) => val)
 *      .done
 *  @param val マッチさせたい値。string | number | symbol の literal union であることが必要
 */
export const condition = <T extends keyof never>(val: T): Condition<T, never> =>
  conditionBody(val, undefined as never);
