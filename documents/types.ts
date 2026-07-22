export type CssValue = string;
export type BlockId = string;
export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";

export interface TextMarks {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: CssValue;
  fontSize?: CssValue;
  highlight?: boolean;
  markStyle?: "mark-primary" | "mark-secondary" | string;
  backgroundColor?: CssValue;
  link?: string;
  target?: LinkTarget;
  br?: true;
}

export interface TextChild {
  text: string;
  marks?: TextMarks;
}

export interface ParagraphChild {
  type: "paragraph";
  children: TextChild[];
}

export interface ListItemChild {
  type: "list-item";
  children: TextChild[];
}

export interface OrderedListChild {
  type: "ordered-list";
  children: ListItemChild[];
}

export interface UnorderedListChild {
  type: "unordered-list";
  children: ListItemChild[];
}

export type RichTextChild =
  | ParagraphChild
  | OrderedListChild
  | UnorderedListChild;

export interface RichTextBlock {
  id: BlockId;
  type: "p";
  children: RichTextChild[];
  textAlign?: "left" | "center" | "right" | "justify" | CssValue;
  fontWeight?: CssValue;
  fontFamily?: CssValue;
  predefinedMargin?: CssValue;
}

export interface InlineTextBlock {
  id: BlockId;
  type: "inline-text";
  elementType: "p" | "h1" | "h2" | "h3";
  children: TextChild[];
  textAlign?: "left" | "center" | "right" | "justify" | CssValue;
  fontWeight?: CssValue;
  fontSize?: CssValue;
  fontFamily?: CssValue;
  predefinedMargin?: CssValue;
}

export interface TableCell {
  children: TextChild[];
  textAlign?: "left" | "center" | "right" | CssValue;
  fontSize?: CssValue;
  fontFamily?: CssValue;
}

export interface TableBlock {
  id: BlockId;
  type: "table";
  cells: TableCell[][];
  headerRow?: boolean;
  headerColumn?: boolean;
  headerBackgroundColor?: CssValue;
  bodyBackgroundColor?: CssValue;
  stripedRows?: boolean;
  stripeBackgroundColor?: CssValue | null;
  borderWidth?: CssValue;
  borderColor?: CssValue;
  borderStyle?: CssValue;
  borderPosition?: CssValue;
  disabled?: boolean;
}

export interface ImageBlock {
  id: BlockId;
  type: "image";
  src: string;
  alt?: string;
  objectFit?: "none" | "contain" | "cover" | "fill" | "scale-down";
  align?: "left" | "center" | "right";
  link?: string;
  target?: LinkTarget;
  backgroundColor?: CssValue;
  borderWidth?: CssValue;
  borderColor?: CssValue;
  borderStyle?: CssValue;
  borderPosition?: CssValue;
  borderRadius?: CssValue;
  disabled?: boolean;
}

export interface IconBlock {
  id: BlockId;
  type: "icon";
  icon: string; // Material Symbols icon name
  fontSize?: CssValue;
  color?: CssValue;
  backgroundColor?: CssValue;
  borderWidth?: CssValue;
  borderColor?: CssValue;
  borderStyle?: CssValue;
  borderPosition?: CssValue;
  borderRadius?: CssValue;
  link?: string;
  target?: LinkTarget;
  align?: "left" | "center" | "right";
  disabled?: boolean;
}

export interface ButtonBlock {
  id: BlockId;
  type: "button";
  text: string;
  icon?: string;
  iconPosition?: "start" | "end" | "none";
  iconFontSize?: CssValue;
  iconColor?: CssValue;
  iconBackgroundColor?: CssValue;
  iconBorderWidth?: CssValue;
  iconBorderColor?: CssValue;
  iconBorderStyle?: CssValue;
  iconBorderPosition?: CssValue;
  iconBorderRadius?: CssValue;
  iconLink?: string;
  iconTarget?: LinkTarget;
  iconDisabled?: boolean;
  color?: CssValue;
  backgroundColor?: CssValue;
  borderWidth?: CssValue;
  borderColor?: CssValue;
  borderStyle?: CssValue;
  borderPosition?: CssValue;
  borderRadius?: CssValue;
  link?: string;
  target?: LinkTarget;
  align?: "left" | "center" | "right";
  disabled?: boolean;
  tag?: "a" | "button";
}

export type FrontendBlock =
  | RichTextBlock
  | InlineTextBlock
  | TableBlock
  | ImageBlock
  | IconBlock
  | ButtonBlock;

export interface FrontendPage {
  version: 1;
  blocks: FrontendBlock[];
}

/** Original editor output, before flattening groups for the frontend. */
export interface GroupStyle {
  backgroundColor?: CssValue;
  borderWidth?: CssValue;
  borderColor?: CssValue;
  borderStyle?: CssValue;
  borderPosition?: CssValue;
  borderRadius?: CssValue;
}

export interface PageGroup<TBlock = FrontendBlock> {
  id: string;
  type: string;
  hashId?: string;
  sort: number;
  style?: GroupStyle;
  blocks: TBlock[];
}

export interface EditorPage<TBlock = FrontendBlock> {
  version: 1;
  groups: PageGroup<TBlock>[];
}