import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { JSX, ComponentType } from 'react';
import { MermaidConfig } from 'mermaid';
export { MermaidConfig } from 'mermaid';
import { RemendOptions } from 'remend';
export { RemendOptions } from 'remend';
import { LanguageRegistration, BundledTheme } from 'shiki';
import { PluggableList, Pluggable } from 'unified';
import { Element } from 'hast';
import { Options as Options$1 } from 'remark-rehype';

type ExtraProps = {
    node?: Element | undefined;
};
type Components = {
    [Key in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[Key] & ExtraProps> | keyof JSX.IntrinsicElements;
};
type Options = {
    children?: string;
    components?: Components;
    rehypePlugins?: PluggableList;
    remarkPlugins?: PluggableList;
    remarkRehypeOptions?: Readonly<Options$1>;
};

/**
 * Common languages bundled with Streamdown
 * These are the most frequently used languages that should have zero latency.
 * Other languages will be loaded on-demand from CDN.
 */

declare const bundledLanguages: Record<string, LanguageRegistration | LanguageRegistration[]>;
type BundledLanguageName = keyof typeof bundledLanguages;
/**
 * Check if a language is bundled (instant loading)
 */
declare const isBundledLanguage: (language: string) => language is BundledLanguageName;

declare const parseMarkdownIntoBlocks: (markdown: string) => string[];

type ControlsConfig = boolean | {
    table?: boolean;
    code?: boolean;
    mermaid?: boolean | {
        download?: boolean;
        copy?: boolean;
        fullscreen?: boolean;
        panZoom?: boolean;
    };
};
type MermaidErrorComponentProps = {
    error: string;
    chart: string;
    retry: () => void;
};
type MermaidOptions = {
    config?: MermaidConfig;
    errorComponent?: React.ComponentType<MermaidErrorComponentProps>;
};
type StreamdownProps = Options & {
    mode?: "static" | "streaming";
    BlockComponent?: React.ComponentType<BlockProps>;
    parseMarkdownIntoBlocksFn?: (markdown: string) => string[];
    parseIncompleteMarkdown?: boolean;
    className?: string;
    shikiTheme?: [BundledTheme, BundledTheme];
    mermaid?: MermaidOptions;
    controls?: ControlsConfig;
    isAnimating?: boolean;
    caret?: keyof typeof carets;
    cdnUrl?: string | null;
    remend?: RemendOptions;
    onCodeApply?: (code: string) => void;
};
declare const defaultRehypePlugins: Record<string, Pluggable>;
declare const defaultRemarkPlugins: Record<string, Pluggable>;
declare const carets: {
    block: string;
    circle: string;
};
type StreamdownContextType = {
    shikiTheme: [BundledTheme, BundledTheme];
    controls: ControlsConfig;
    isAnimating: boolean;
    mode: "static" | "streaming";
    mermaid?: MermaidOptions;
    cdnUrl?: string | null;
    onCodeApply?: (code: string) => void;
};
declare const StreamdownContext: react.Context<StreamdownContextType>;
type BlockProps = Options & {
    content: string;
    shouldParseIncompleteMarkdown: boolean;
    index: number;
};
declare const Block: react.MemoExoticComponent<({ content, ...props }: BlockProps) => react_jsx_runtime.JSX.Element>;
declare const Streamdown: react.MemoExoticComponent<({ children, mode, parseIncompleteMarkdown: shouldParseIncompleteMarkdown, components, rehypePlugins, remarkPlugins, className, shikiTheme, mermaid, controls, isAnimating, BlockComponent, parseMarkdownIntoBlocksFn, caret, cdnUrl, remend: remendOptions, onCodeApply, ...props }: StreamdownProps) => react_jsx_runtime.JSX.Element>;

export { Block, type BundledLanguageName, type ControlsConfig, type MermaidErrorComponentProps, type MermaidOptions, Streamdown, StreamdownContext, type StreamdownContextType, type StreamdownProps, bundledLanguages, defaultRehypePlugins, defaultRemarkPlugins, isBundledLanguage, parseMarkdownIntoBlocks };
