import { useEffect, useRef } from 'react';

import {
  BalloonEditor,
  Alignment,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  BlockToolbar,
  Bold,
  Bookmark,
  Code,
  CodeBlock,
  Emoji,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageTextAlternative,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  Mention,
  Paragraph,
  PlainTableOutput,
  RemoveFormat,
  Strikethrough,
  Style,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableLayout,
  TableProperties,
  TableToolbar,
  Underline,
} from '~/libs/ckeditor5/ckeditor5';
import translations from '~/libs/ckeditor5/translations/vi';
import '~/libs/ckeditor5/ckeditor5.css';

interface Props {
  content: string;
}

const editorConfig = {
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'heading',
      'style',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'code',
      'removeFormat',
      '|',
      'emoji',
      'horizontalLine',
      'link',
      'bookmark',
      'insertImageViaUrl',
      'insertTable',
      'insertTableLayout',
      'highlight',
      'blockQuote',
      'codeBlock',
      '|',
      'alignment',
      '|',
      'outdent',
      'indent',
    ],
    shouldNotGroupWhenFull: false,
  },
  plugins: [
    Alignment,
    AutoImage,
    AutoLink,
    Autosave,
    BlockQuote,
    BlockToolbar,
    Bold,
    Bookmark,
    Code,
    CodeBlock,
    Emoji,
    Essentials,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    GeneralHtmlSupport,
    Heading,
    Highlight,
    HorizontalLine,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsertViaUrl,
    ImageTextAlternative,
    ImageToolbar,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    Mention,
    Paragraph,
    PlainTableOutput,
    RemoveFormat,
    Strikethrough,
    Style,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableLayout,
    TableProperties,
    TableToolbar,
    Underline,
  ],
  blockToolbar: [
    'fontSize',
    'fontColor',
    'fontBackgroundColor',
    '|',
    'bold',
    'italic',
    '|',
    'link',
    'insertTable',
    'insertTableLayout',
    '|',
    'outdent',
    'indent',
  ],
  fontFamily: {
    supportAllValues: true,
  },
  fontSize: {
    options: [10, 12, 14, 'default', 18, 20, 22],
    supportAllValues: true,
  },
  heading: {
    options: [
      {
        model: 'paragraph',
        title: 'Paragraph',
        class: 'ck-heading_paragraph',
      },
      {
        model: 'heading1',
        view: 'h1',
        title: 'Heading 1',
        class: 'ck-heading_heading1',
      },
      {
        model: 'heading2',
        view: 'h2',
        title: 'Heading 2',
        class: 'ck-heading_heading2',
      },
      {
        model: 'heading3',
        view: 'h3',
        title: 'Heading 3',
        class: 'ck-heading_heading3',
      },
      {
        model: 'heading4',
        view: 'h4',
        title: 'Heading 4',
        class: 'ck-heading_heading4',
      },
      {
        model: 'heading5',
        view: 'h5',
        title: 'Heading 5',
        class: 'ck-heading_heading5',
      },
      {
        model: 'heading6',
        view: 'h6',
        title: 'Heading 6',
        class: 'ck-heading_heading6',
      },
    ],
  },
  htmlSupport: {
    allow: [
      {
        name: /^.*$/,
        styles: true,
        attributes: true,
        classes: true,
      },
    ],
  },
  image: {
    toolbar: ['toggleImageCaption', 'imageTextAlternative'],
  },
  language: 'vi',
  licenseKey: 'GPL',
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: 'https://',
    decorators: {
      toggleDownloadable: {
        mode: 'manual',
        label: 'Downloadable',
        attributes: {
          download: 'file',
        },
      },
    },
  },
  mention: {
    feeds: [
      {
        marker: '@',
        feed: [],
      },
    ],
  },
  placeholder: 'Type or paste your content here!',
  style: {
    definitions: [
      {
        name: 'Article category',
        element: 'h3',
        classes: ['category'],
      },
      {
        name: 'Title',
        element: 'h2',
        classes: ['document-title'],
      },
      {
        name: 'Subtitle',
        element: 'h3',
        classes: ['document-subtitle'],
      },
      {
        name: 'Info box',
        element: 'p',
        classes: ['info-box'],
      },
      {
        name: 'CTA Link Primary',
        element: 'a',
        classes: ['button', 'button--green'],
      },
      {
        name: 'CTA Link Secondary',
        element: 'a',
        classes: ['button', 'button--black'],
      },
      {
        name: 'Marker',
        element: 'span',
        classes: ['marker'],
      },
      {
        name: 'Spoiler',
        element: 'span',
        classes: ['spoiler'],
      },
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
  },
  translations: [translations],
};

export default function CkEditor({ content }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorInstanceRef.current) return;

    BalloonEditor.create(editorRef.current, editorConfig)
      .then((editor: any) => {
        editorInstanceRef.current = editor;
        if (content) editor.setData(content);
        return () => {
          editor.destroy();
          editorInstanceRef.current = null;
        };
      })
      .catch((error: any) => {
        console.error('Error initializing CKEditor:', error);
      });
  }, []);

  useEffect(() => {
    if (editorInstanceRef.current && content) {
      editorInstanceRef.current.setData(content);
    }
  }, [content]);

  return <div ref={editorRef} className="h-full w-full border-none!" tabIndex={0} />;
}
