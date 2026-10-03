import React, { createContext, useContext } from "react";

export type SsrDataBag = Record<string, unknown>;

const SsrDataContext = createContext<SsrDataBag>({});

export const SsrDataProvider = ({
  data,
  children,
}: {
  data: SsrDataBag;
  children: React.ReactNode;
}) => <SsrDataContext.Provider value={data}>{children}</SsrDataContext.Provider>;

export function useSsrData<T = unknown>(key: string): T | undefined {
  const bag = useContext(SsrDataContext);
  return bag[key] as T | undefined;
}