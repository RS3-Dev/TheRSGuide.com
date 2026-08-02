import { GithubIcon } from "lucide-react"

const GITHUB_ISSUES_URL =
  "https://github.com/RS3-Dev/TheRSGuide.com/issues"

function GithubIssueLink() {
  return (
    <p className="mt-auto mb-0 flex items-start gap-[.65rem] border-t px-3 pt-4 text-[.73rem] leading-[1.5] text-muted-foreground [&>svg]:mt-[.05rem] [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-foreground [&_a]:font-bold [&_a]:text-foreground [&_a]:underline [&_a]:decoration-foreground/35 [&_a]:underline-offset-[.2em] [&_a:hover]:decoration-current [&_a:focus-visible]:rounded-[.15rem] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-3 [&_a:focus-visible]:outline-ring">
      <GithubIcon aria-hidden="true" />
      <span>
        See something wrong? Feel free to{" "}
        <a href={GITHUB_ISSUES_URL} target="_blank" rel="noreferrer">
          open an issue on GitHub
        </a>
        .
      </span>
    </p>
  )
}

export { GithubIssueLink }
