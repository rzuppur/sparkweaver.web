export interface Route {
  path: "projects" | "project" | "remote" | "not-found";
  params?: { [key: string]: string };
}

export function routeToPath(route: Route): string {
  let path = `/${route.path}`;
  if (route.params) {
    path += `?${new URLSearchParams(route.params).toString()}`;
  }
  return path;
}
