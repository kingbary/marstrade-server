type IssueParams<T> = {
  array: T[];
  element: T;
};

export const addIssue = <T>({ array, element }: IssueParams<T>) => {
  const uniqueSet = new Set(array);
  uniqueSet.add(element);
  return Array.from(uniqueSet);
};

export const removeIssue = <T>({ array, element }: IssueParams<T>) => {
  const uniqueSet = new Set(array);
  uniqueSet.delete(element);
  return Array.from(uniqueSet);
};
