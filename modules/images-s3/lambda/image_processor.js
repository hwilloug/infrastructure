const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const Sharp = require('sharp');
const s3 = new S3Client();

exports.handler = async (event) => {
  // Extract the CloudFront request from the event.
  const request = event.Records[0].cf.request;
  const { uri, querystring } = request;
  
  // Get the bucket name from the request origin
  const bucket = request.origin.s3.domainName.split('.')[0];

  // Parse query string parameters. Expecting: w (width), h (height), q (quality)
  let width = null;
  let height = null;
  let quality = 80; // default quality if not provided
  let format = 'jpeg';

  if (querystring) {
    // querystring comes as a string like "w=800&h=600&q=80"
    const params = new URLSearchParams(querystring);
    if (params.has('w')) {
      width = parseInt(params.get('w'), 10);
    }
    if (params.has('h')) {
      height = parseInt(params.get('h'), 10);
    }
    if (params.has('q')) {
      quality = parseInt(params.get('q'), 10);
    }
    if (params.has('f')) {
      format = params.get('f');
    }
  }

  // Remove the leading slash from the URI to form the S3 object key
  const key = uri.startsWith('/') ? uri.slice(1) : uri;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    const s3Object = await s3.send(command);
    
    let image = Sharp(await s3Object.Body.transformToByteArray());
    if (width || height) {
      image = image.resize(width, height);
    }
    try {
      let processedImageBuffer;
      if (format === "jpeg" || format === "jpg") {
        const qualityNum = parseInt(quality, 10);
        if (isNaN(qualityNum) || qualityNum < 1 || qualityNum > 100) {
          throw new Error('Quality must be a number between 1 and 100');
        }
        processedImageBuffer = await image.jpeg({ quality: qualityNum }).toBuffer();
      } else if (format === "png") {
        processedImageBuffer = await image.png().toBuffer();
      } else {
        processedImageBuffer = await image.toBuffer();
      }
      return {
        status: '200',
        statusDescription: 'OK',
        headers: {
          'content-type': [{
            key: 'Content-Type',
            value: `image/${format}`
          }]
        },
        body: processedImageBuffer.toString('base64'),
        bodyEncoding: 'base64'
      };
    } catch (err) {
      console.error("Error during image processing:", err);
      throw err;
    }
  } catch (error) {
    console.error("Error processing image:", error);
    // If an error occurs, return a 500 response.
    return {
      status: '500',
      statusDescription: 'Internal Server Error'
    };
  }
};