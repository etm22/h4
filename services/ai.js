const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const crc = require("crc");
const WebSocket = require("ws");
const archiver = require("archiver");
const { execSync } = require("child_process");

async function getUploadCredentialsForAudio() {
  const data = JSON.stringify({
    biz: "replicate",
    key_version: "v5",
  });

  const config = {
    method: "post",
    url: "https://editor-api-va.capcut.com/lv/v1/upload_sign",
    headers: {
      "app-sdk-version": "2.9.0",
      "content-type": "application/json",
      appid: "359289",
      appvr: "2.9.0",
      "device-time": 1701239674,
      lan: "en",
      loc: "US",
      pf: "4",
      sign: "35e92b2801f3fda321425d8502cd469c",
      "sign-ver": "1",
      tdid: "7216623130209994242",
      "x-ss-dp": "359289",
      "x-tt-trace-id":
        "00-19c9571b10642698806a08c6023affff-19c9571b10642698-01",
      "user-agent":
        "Cronet/TTNetVersion:3024dcd7 2023-10-18 QuicVersion:4bf243e0 2023-04-17",
    },
    data: data,
  };

  const response = await axios(config);
  const { session_token, access_key_id, current_time, secret_access_key } =
    response.data.data;

  // part 2
  const sign = (key, msg) => {
    return crypto.createHmac("sha256", key).update(msg).digest();
  };
  const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
    let kDate = sign(("AWS4" + key).toString(), dateStamp);
    let kRegion = sign(kDate, regionName);
    let kService = sign(kRegion, serviceName);
    let kSigning = sign(kService, "aws4_request");
    return kSigning;
  };
  const convertDateFormat = (dateString) => {
    return dateString.replace(/-|:/g, "");
  };

  const method = "GET";
  const canonicalUri = "/top/v1";
  const canonicalQueryString =
    "Action=ApplyUploadInner&FileType=object&SpaceName=lv-replicate-va&UploadNum=1&Version=2020-11-19&device_platform=win";
  const canonicalHeaders = `x-amz-date:${convertDateFormat(
    current_time
  )}\nx-amz-security-token:${session_token}`;
  const signedHeaders = "x-amz-date;x-amz-security-token";
  const hashedPayload = crypto.createHash("sha256").update("").digest("hex");

  const date = convertDateFormat(current_time);
  const dateStamp = date.split("T")[0];
  const regionName = "sdwdmwlll";
  const serviceName = "vod";

  // String to sign
  const credentialScope = `${dateStamp}/${regionName}/${serviceName}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    credentialScope,
    crypto
      .createHash("sha256")
      .update(
        [
          method,
          canonicalUri,
          canonicalQueryString,
          canonicalHeaders,
          "",
          signedHeaders,
          hashedPayload,
        ].join("\n")
      )
      .digest("hex"),
  ].join("\n");

  // Calculate the signature
  const signingKey = getSignatureKey(
    secret_access_key,
    dateStamp,
    regionName,
    serviceName
  );
  const signature = sign(signingKey, stringToSign).toString("hex");

  const config_2 = {
    method: "get",
    url: `https://vas-maliva16.byteoversea.com/${canonicalUri}?${canonicalQueryString}`,
    headers: {
      Authorization: `AWS4-HMAC-SHA256 Credential=${access_key_id}/${dateStamp}/${regionName}/${serviceName}/aws4_request, SignedHeaders=x-amz-date;x-amz-security-token, Signature=${signature}`,
      Date: new Date(),
      "X-Amz-Date": convertDateFormat(current_time),
      "X-Amz-Expires": "31536000",
      "X-Amz-Security-Token": session_token,
    },
  };

  const response_2 = await axios(config_2);
  return response_2.data.Result;
}

async function uploadAudio(uploadCredentials, audioPath) {
  const fileData = fs.readFileSync(audioPath);
  const checksum = crc.crc32(fileData).toString(16);

  const headers = {
    Authorization: uploadCredentials.UploadAddress.StoreInfos[0].Auth,
    "X-Upload-Content-CRC32": checksum,
  };
  const url = `https://${uploadCredentials.UploadAddress.UploadHosts}/upload/v1/${uploadCredentials.UploadAddress.StoreInfos[0].StoreUri}`;

  await axios.post(url, fileData, {
    headers,
  });
}

async function createAnimation(
  uploadCredentials,
  digital_human_id,
  video_save_path,
  mask_save_path
) {
  const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const data = JSON.stringify({
    bind_id: "D930DEE2-37A0-440c-86AB-0049668FEAE9",
    enter_from: "edit_draft",
    tasks: [
      {
        algo_type: 0,
        payload: `{\n    \"digital_human_id\": \"${digital_human_id}\",\n    \"tts_duration\": 1,\n    \"tts_uri\": \"${uploadCredentials.UploadAddress.StoreInfos[0].StoreUri}\"\n}\n`,
        type: 4,
      },
    ],
  });

  const config = {
    method: "post",
    url: "https://editor-api-va.capcut.com/lv/v1/common_task/new",
    headers: {
      "app-sdk-version": "2.9.0",
      "content-type": "application/json",
      appid: "359289",
      appvr: "2.9.0",
      "device-time": "1701239679",
      lan: "en",
      loc: "US",
      pf: "4",
      sign: "6f839a12fa746398e6b271d13a8aee1e",
      "sign-ver": "1",
      tdid: "7216623130209994242",
      "x-ss-dp": "359289",
      "x-tt-trace-id":
        "00-19c96a8b10642698806a08c602feffff-19c96a8b10642698-01",
      "user-agent":
        "Cronet/TTNetVersion:3024dcd7 2023-10-18 QuicVersion:4bf243e0 2023-04-17",
    },
    data: data,
  };

  const response = await axios(config);
  const { id, token } = response.data.data.tasks[0];

  let data_2 = JSON.stringify({
    tasks: [
      {
        algo_type: 0,
        bind_id: "D930DEE2-37A0-440c-86AB-0049668FEAE9",
        id: id,
        token: token,
      },
    ],
  });

  let config_2 = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://editor-api-va.capcut.com/lv/v1/common_task/query",
    headers: {
      "app-sdk-version": "2.9.0",
      "content-type": "application/json",
      appid: "359289",
      appvr: "2.9.0",
      "device-time": "1701239690",
      lan: "en",
      loc: "US",
      pf: "4",
      sign: "1b0040aba775cf632ebdb9259afde586",
      "sign-ver": "1",
      tdid: "7216623130209994242",
      "x-ss-dp": "359289",
      "x-tt-trace-id":
        "00-19c9958b10642698806a08c60263ffff-19c9958b10642698-01",
      "user-agent":
        "Cronet/TTNetVersion:3024dcd7 2023-10-18 QuicVersion:4bf243e0 2023-04-17",
    },
    data: data_2,
  };

  let response_2;
  let status = "";

  while (status != "succeed") {
    response_2 = await axios(config_2);
    status = response_2.data.data.tasks[0].status;
    await sleep(1000);
  }
  const video_url = JSON.parse(response_2.data.data.tasks[0].payload)
    .digital_human_video.video_url;
  const mask_url = JSON.parse(response_2.data.data.tasks[0].payload)
    .digital_human_mask_video.video_url;

  const videoResponse = await axios.get(video_url, {
    responseType: "arraybuffer",
  });
  const maskResponse = await axios.get(mask_url, {
    responseType: "arraybuffer",
  });
  fs.writeFileSync(video_save_path, videoResponse.data);
  fs.writeFileSync(mask_save_path, maskResponse.data);
}

async function convertTTS(text, speaker) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      "wss://sami-maliva.byteintlapi.com/internal/api/v1/ws"
    );
    const data = {};

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          appkey: "ddjeqjLGMn",
          event: "StartTask",
          namespace: "TTS",
          payload: `{"audio_config":{"bit_rate":64000,"enable_timestamp":true,"format":"ogg_opus","pitch_rate":0,"sample_rate":24000},"speaker":"${speaker}","texts":["${text}"]}`,
          token:
            "WEtPclZJR0V6SHVUZXAyT09yhoz2s7BkBQVoosFp/Y7M7kD2WGxHTWPNx2VyD3XykHyBAEsefstrFWiyqz8XCZI4Jdj3d3zF64VVl5hoHB/b21vBPVB1sHOEEJ030SOit5EZQc5+nCrWlz6oW1JCEjyItAzuWC3Jj6pvSSEuJtUHbQjHaAJYUTq3fWg93bkj4R9TVyR8FextiJsx5Iv9VmK3eGFyvlMdyUiULKCfJV7k6lm2oX+mGld90xSUHLEhjeMmTbqnCLFSRkP2taVacMCvQ29GM1BqaY2h3hIVyNaOWWG1oZbBYmqTLCFKIgLKlAf3yr7IXalg+J7scCrbaJVVTY0GrgrBhWEnUDz+A5GtBTz2BvTi4JAfe7ZUryf+rhTI6OAVPuu0ge0imweVUPp4FOze291IqdRIVnDVsgKMtmqVT4UraLwgQlvooiO7wKvzYhcWdkfolpCwjDvqCEocy5UYtxFuvfdf7iACigeozAJoerCtsY6z677EvYPF/v6rhvRB5sEOvMv+dBcrD+Q+1m8DBcVx+bmzAWt/BHMovFoQuLx1EPbuOmg2Q2tzU58Y160etJqnUMgWM7QhcI4Q1rf9CFGPundxxWKdIJDpIS09cTiOQRpuZO68T0aUWjv41KpXvbFFc2uNkp7Xm0azAW9Dv/YPQTn4Gk9Yi8ZMVvBUzMsvX+6Jwm6q2QAwMNxbbER4LPwJ2MMm2ByKzw==",
          version: "sdk_v1",
        })
      );
    });

    ws.on("message", async (message) => {
      try {
        const response = JSON.parse(message.toString("utf-8"));
        if (response.event == "TTSResponse") {
          data.payload = JSON.parse(response.payload);
          data.message_id = response.message_id;
        }
      } catch (error) {
        data.audio = message;
        resolve(data);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    });
  });
}

async function createZip(outputPath, files) {
  return new Promise((resolve, reject) => {
    // Create a file to stream archive data to.
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    // Listen for all archive data to be written
    output.on("close", () => {
      //   console.log(`ZIP file created: ${archive.pointer()} total bytes`);
      resolve();
    });

    // Good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn(err);
      } else {
        // Throw error for any other warning
        reject(err);
      }
    });

    // Catch errors explicitly
    archive.on("error", (err) => {
      reject(err);
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Append files from a sub-directory, putting its contents at the root of archive
    files.forEach((file) => {
      archive.file(file.path, { name: file.name });
    });

    // Finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();
  });
}

async function createTalkingAnimation({
  text,
  speaker,
  digital_human_id,
  output_dir,
  video_name,
}) {
  const { audio, payload, message_id } = await convertTTS(text, speaker);
  fs.writeFileSync(`${output_dir}/${message_id}.wav`, audio);
  fs.writeFileSync(
    `${output_dir}/meta.json`,
    JSON.stringify({
      [`${message_id}.wav`]: {
        offset: 0,
        phonemes: JSON.stringify(payload.alignment.phonemes),
      },
    })
  );
  await createZip(`${output_dir}/audio.zip`, [
    { path: `${output_dir}/${message_id}.wav`, name: `${message_id}.wav` },
    { path: `${output_dir}/meta.json`, name: "meta.json" },
  ]);
  const uploadCredentials = await getUploadCredentialsForAudio();
  await uploadAudio(uploadCredentials, `${output_dir}/audio.zip`);
  await createAnimation(
    uploadCredentials,
    digital_human_id,
    `${output_dir}/speaker.mp4`,
    `${output_dir}/mask.mp4`
  );

  execSync(
    `ffmpeg -y -i "${output_dir}/speaker.mp4" -i "${output_dir}/mask.mp4" -filter_complex "[0:v][1:v]alphamerge,format=yuva420p" -c:v qtrle "${output_dir}/${video_name}.mov"`
  );

  fs.unlinkSync(`${output_dir}/meta.json`);
  fs.unlinkSync(`${output_dir}/audio.zip`);
  fs.unlinkSync(`${output_dir}/speaker.mp4`);
  fs.unlinkSync(`${output_dir}/mask.mp4`);
  fs.unlinkSync(`${output_dir}/${message_id}.wav`);
}

module.exports = { createTalkingAnimation };
