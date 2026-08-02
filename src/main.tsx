import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import '@fontsource-variable/nunito'
import '@fontsource-variable/source-serif-4'
import { AppRouter } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
)
