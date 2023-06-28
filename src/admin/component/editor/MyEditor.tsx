import { Editor } from "@tinymce/tinymce-react";
import React, { useEffect, useRef } from "react";
import { Editor as EditorType } from "tinymce";

type Props = {
  reset?: {
    status: boolean;
    setReset: (status: boolean) => void;
  };
  setValue: (value: string) => void;
  setCharCount?: (value: number) => void;
  initData?: string;
};

const MyEditor: React.FC<Props> = ({
  setValue,
  setCharCount,
  reset,
  initData = "",
}) => {
  const editorRef = useRef<EditorType | null>(null);

  useEffect(() => {
    if (reset && reset.status) {
      editorRef.current?.resetContent("");
      reset.setReset(false);
    }
  }, [reset]);

  return (
    <div style={{ minHeight: "300px", height: "300px" }}>
      <Editor
        tinymceScriptSrc={process.env.PUBLIC_URL + "/tinymce/tinymce.min.js"}
        onInit={(evt, editor) => {
          editorRef.current = editor;
          const elem: HTMLButtonElement | null = editor
            .getContainer()
            .querySelector("button.tox-statusbar__wordcount");
          if (elem) {
            elem.click();
          }
        }}
        initialValue={initData}
        onChange={() => {
          const editor = editorRef.current;
          if (editor) {
            const wordcount = editor.plugins["wordcount"];
            const charCount: number = wordcount.body.getCharacterCount();
            if (setCharCount) {
              setCharCount(charCount);
            }
            const content = editor.getContent();
            setValue(content);
          }
        }}
        init={{
          height: "100%",
          min_height: 300,
          resize: false,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "preview",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
    </div>
  );
};

export default MyEditor;
