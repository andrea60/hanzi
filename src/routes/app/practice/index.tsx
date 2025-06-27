import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/practice/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/practice/"!</div>
}
