"use client";
import { useTheme } from "next-themes";
import React from "react";

import D3WordCloud from "react-d3-cloud";
import { text } from "stream/consumers";
type Props = {};

const data = [
  {
    text: "hey",
    value: 3,
  },
  {
    text: "hi",
    value: 5,
  },
  {
    text: "CS",
    value: 10,
  },
  {
    text: "next",
    value: 6,
  },
  {
    text: "mern",
    value: 8,
  },
];

const WordCloud = (props: Props) => {
  const theme = useTheme();

  const fontSizeMapper = (word: { value: number }) =>
    Math.log2(word.value) * 5 + 16;
  return (
    <>
      <D3WordCloud
        data={data}
        height={550}
        font="Times"
        fontSize={fontSizeMapper}
        rotate={0}
        padding={10}
        fill={theme.theme === "dark" ? "white" : "black"}
      />
    </>
  );
};

export default WordCloud;
