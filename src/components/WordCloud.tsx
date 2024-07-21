"use client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React from "react";

import D3WordCloud from "react-d3-cloud";
import { text } from "stream/consumers";
type Props = {
  formattedTopics: { text: string; value: number }[];
};

const WordCloud = ({ formattedTopics }: Props) => {
  const theme = useTheme();
  const router = useRouter();

  const fontSizeMapper = (word: { value: number }) =>
    Math.log2(word.value) * 5 + 16;
  return (
    <>
      <D3WordCloud
        data={formattedTopics}
        height={550}
        font="Times"
        fontSize={fontSizeMapper}
        rotate={0}
        padding={10}
        fill={theme.theme === "dark" ? "white" : "black"}
        onWordClick={(e, d) => {
          router.push("/quiz?topic=" + d.text);
        }}
      />
    </>
  );
};

export default WordCloud;
