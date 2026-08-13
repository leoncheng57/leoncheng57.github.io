/**
 * CSS module map injected into the shared markdown components.
 *
 * Blog articles and guides render the same markdown but use different visual
 * themes, so each feature passes its own stylesheet instead of the components
 * importing one directly.
 *
 * A stylesheet must provide: articleBody, figureBlock, calloutRow, calloutBox,
 * heading, headingRow, headingAnchor, figure, imageButton, articleImage,
 * figureCaption, imageOverlay, imageOverlayInner, imageClose, zoomedImage.
 */
export type ArticleStyles = Record<string, string>
