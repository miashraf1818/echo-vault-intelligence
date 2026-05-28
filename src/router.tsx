import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Global React Query defaults for the demo:
  //   - queries retry once on transient failure (network blips, cold starts)
  //   - mutations never retry — uploads/searches/reflections are user-driven
  //     and a silent retry can mask backend errors or duplicate side effects.
  // Per design.md "Frontend hooks and React Query integration".
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 1 },
      mutations: { retry: 0 },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
