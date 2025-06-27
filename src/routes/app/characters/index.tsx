import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/characters/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/characters/"!</div>
}
