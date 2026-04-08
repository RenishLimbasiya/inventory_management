"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "@/store";
import { WarehouseProvider } from "@/context/WarehouseContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>
        <WarehouseProvider>{children}</WarehouseProvider>
      </Provider>
    </ThemeProvider>
  );
}
