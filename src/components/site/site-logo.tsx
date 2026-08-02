import { Link } from "react-router"

function SiteLogo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center whitespace-nowrap font-brand font-bold tracking-[.02em]"
      aria-label="The RS Guide home"
    >
      The RS Guide
    </Link>
  )
}

export { SiteLogo }
