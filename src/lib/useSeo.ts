import { useEffect } from 'react'

type Seo = {
  title: string
  description: string
  robots?: string
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/** Keeps the document title and social metadata in sync with the current route. */
export function useSeo({ title, description, robots = 'index,follow' }: Seo) {
  useEffect(() => {
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', robots)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
  }, [title, description, robots])
}
