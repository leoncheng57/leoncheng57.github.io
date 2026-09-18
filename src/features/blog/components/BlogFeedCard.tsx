import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import TagList from '../../../components/markdown/TagList'
import GuideRepoReference from '../../guides/components/GuideRepoReference'
import type { FeedEntry } from '../feed'
import styles from '../blog.module.css'
import guideStyles from '../../guides/guides-index.module.css'

interface Props {
  post: FeedEntry
  selectedTags?: string[]
  onTagClick?: (_tag: string) => void
  headingLevel?: 2 | 3
  titleOnly?: boolean
  footer?: ReactNode
}

export default function BlogFeedCard({ post, selectedTags, onTagClick, headingLevel = 2, titleOnly = false, footer }: Props) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2'
  return (
            <article className={`${styles.postCard} ${post.kind === 'Guide' ? `${guideStyles.guideCard} ${styles.feedGuide}` : ''}`}>
              <Heading>
                {post.href.startsWith('https://') ? <a href={post.href}>{post.title}</a> : <Link to={post.href}>{post.title}</Link>}
              </Heading>
              {!titleOnly && <>
              {post.guide ? (
                <div className={styles.feedRepo}>
                  <GuideRepoReference repoUrl={post.guide.repoUrl} repoAccess={post.guide.repoAccess} repoScope={post.guide.repoScope} />
                </div>
              ) : null}
              <p>{post.description}</p>
              <div className={styles.indexMeta}>
                <p><time dateTime={post.date}>{post.date}</time></p>
                {post.readingTimeMinutes ? <p>{post.readingTimeMinutes} min read</p> : null}
              </div>
              <TagList
                tags={post.tags}
                selectedTags={selectedTags}
                onTagClick={onTagClick}
                styles={styles}
              />
              </>}
              {footer}
            </article>
  )
}
