// const {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } = require("@google/generative-ai");

// const apiKey = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
// });

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 64,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };

// interface OutputFormat {
//   [key: string]: string | string[] | OutputFormat;
// }

// async function strict_output(
//   system_prompt: string,
//   user_prompt: string | string[],
//   output_format: OutputFormat,
//   default_category: string = "",
//   output_value_only: boolean = false,
//   temperature: number = 1,
//   num_tries: number = 3,
//   verbose: boolean = false
// ) {
//   const list_input = Array.isArray(user_prompt);
//   const dynamic_elements = /<.*?>/.test(JSON.stringify(output_format));
//   const list_output = /\[.*?\]/.test(JSON.stringify(output_format));

//   let error_msg = "";

//   for (let i = 0; i < num_tries; i++) {
//     let output_format_prompt = `\nYou are to output ${
//       list_output ? "an array of objects in" : ""
//     } the following in json format: ${JSON.stringify(
//       output_format
//     )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

//     if (list_output) {
//       output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
//     }

//     if (dynamic_elements) {
//       output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
//     }

//     if (list_input) {
//       output_format_prompt += `\nGenerate an array of json, one json for each input element.`;
//     }

//     const chatSession = model.startChat({
//       generationConfig: {
//         ...generationConfig,
//         temperature: temperature,
//       },
//       history: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: user_prompt.toString(),
//             },
//           ],
//         },
//         {
//           role: "system",
//           parts: [
//             {
//               text: (
//                 system_prompt +
//                 output_format_prompt +
//                 error_msg
//               ).toString(),
//             },
//           ],
//         },
//       ],
//     });

//     const result = await chatSession.sendMessage({});

//     let res = result.response.text().replace(/'/g, '"');
//     res = res.replace(/(\w)"(\w)/g, "$1'$2");

//     if (verbose) {
//       console.log(
//         "System prompt:",
//         system_prompt + output_format_prompt + error_msg
//       );
//       console.log("\nUser prompt:", user_prompt);
//       console.log("\nGPT response:", res);
//     }

//     try {
//       let output = JSON.parse(res);

//       if (list_input) {
//         if (!Array.isArray(output)) {
//           throw new Error("Output format not in an array of json");
//         }
//       } else {
//         output = [output];
//       }

//       for (let index = 0; index < output.length; index++) {
//         for (const key in output_format) {
//           if (/<.*?>/.test(key)) {
//             continue;
//           }

//           if (!(key in output[index])) {
//             throw new Error(`${key} not in json output`);
//           }

//           if (Array.isArray(output_format[key])) {
//             const choices = output_format[key] as string[];
//             if (Array.isArray(output[index][key])) {
//               output[index][key] = output[index][key][0];
//             }
//             if (!choices.includes(output[index][key]) && default_category) {
//               output[index][key] = default_category;
//             }
//             if (output[index][key].includes(":")) {
//               output[index][key] = output[index][key].split(":")[0];
//             }
//           }
//         }

//         if (output_value_only) {
//           output[index] = Object.values(output[index]);
//           if (output[index].length === 1) {
//             output[index] = output[index][0];
//           }
//         }
//       }

//       return list_input ? output : output[0];
//     } catch (e) {
//       error_msg = `\n\nResult: ${res}\n\nError message: ${e}`;
//       console.log("An exception occurred:", e);
//       console.log("Current invalid json format ", res);
//     }
//   }

//   return [];
// }

// export { strict_output };

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
) {
  const list_input = Array.isArray(user_prompt);
  const dynamic_elements = /<.*?>/.test(JSON.stringify(output_format));
  const list_output = /\[.*?\]/.test(JSON.stringify(output_format));

  let error_msg = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt = `\nYou are to output ${
      list_output ? "an array of objects in" : ""
    } the following in json format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate an array of json, one json for each input element.`;
    }

    const chatSession = model.startChat({
      generationConfig: {
        ...generationConfig,
        temperature: temperature,
      },
      history: [
        {
          role: "user",
          parts: [
            {
              text: user_prompt.toString(),
            },
          ],
        },
        {
          role: "system",
          parts: [
            {
              text: system_prompt + output_format_prompt + error_msg,
            },
          ],
        },
      ],
    });
    let res;
    try {
      const result = await chatSession.sendMessage({});
      res = result.response.text().replace(/'/g, '"');
      res = res.replace(/(\w)"(\w)/g, "$1'$2");
      console.log("yeh hai response ", res);
      if (verbose) {
        console.log(
          "System prompt:",
          system_prompt + output_format_prompt + error_msg
        );
        console.log("\nUser prompt:", user_prompt);
        console.log("\nGPT response:", res);
      }

      let output = JSON.parse(res);

      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error("Output format not in an array of json");
        }
      } else {
        output = [output];
      }

      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          if (/<.*?>/.test(key)) {
            continue;
          }

          if (!(key in output[index])) {
            throw new Error(`${key} not in json output`);
          }

          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        if (output_value_only) {
          output[index] = Object.values(output[index]);
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0];
    } catch (e) {
      error_msg = `\n\nResult: ${res!}\n\nError message: ${e}`;
      console.log("An exception occurred:", e);
      console.log("Current invalid json format ", res!);
    }
  }

  return [];
}

export { strict_output };
