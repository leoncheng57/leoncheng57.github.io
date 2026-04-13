import type { ReactElement } from 'react'
import type { BlogPost } from '../types'
import styles from '../blog.module.css'
import TagList from './TagList'

interface BlogMetaProps {
  post: BlogPost
}

export default function BlogMeta({ post }: BlogMetaProps): ReactElement {
  return (
    <div className={styles.meta}>
      <p>Published: {post.publishedAt}</p>
      {post.updatedAt ? <p>Last updated: {post.updatedAt}</p> : null}
      <p>Estimated reading time: {post.readingTimeMinutes} min</p>
      <TagList tags={post.tags} />
    </div>
  )
}
