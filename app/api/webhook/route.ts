// import {
//   deleteUserNotificationDetails,
//   setUserNotificationDetails,
// } from "@/lib/notification";
// // import { sendFrameNotification } from "@/lib/notification-client";
// import { prisma } from "@/lib/prisma";
// import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { NextRequest, NextResponse } from "next/server";

// // const appName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME;

// /**
//  * Validates webhook event signature according to Farcaster's JSON Farcaster Signature format
//  * Events are signed by the app key of a user with a JSON Farcaster Signature.
//  */
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function validateWebhookEventSignature(requestJson: any) {
//   try {
//     const { header: encodedHeader, payload: encodedPayload } = requestJson;

//     if (!encodedHeader || !encodedPayload) {
//       throw new Error("Missing header or payload in webhook request");
//     }

//     // Decode the base64url encoded header and payload
//     const headerData = JSON.parse(
//       Buffer.from(encodedHeader, "base64url").toString("utf-8")
//     );
//     const event = JSON.parse(
//       Buffer.from(encodedPayload, "base64url").toString("utf-8")
//     );

//     console.log("Decoded webhook data:", { headerData, event });

//     // Basic validation
//     if (!headerData.fid || !headerData.key) {
//       throw new Error("Invalid header data: missing fid or key");
//     }

//     if (!event.event) {
//       throw new Error("Invalid payload: missing event type");
//     }

//     // TODO: Add proper cryptographic signature validation here
//     // For now, we'll trust the webhook payload structure
//     // In production, you should validate the signature against the app key

//     return {
//       fid: headerData.fid,
//       key: headerData.key,
//       event: event,
//     };
//   } catch (error) {
//     console.error("Webhook signature validation failed:", error);
//     throw new Error(
//       `Invalid webhook signature: ${error instanceof Error ? error.message : String(error)}`
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     console.log("Received webhook request");

//     const requestJson = await request.json();
//     console.log("Request JSON:", JSON.stringify(requestJson, null, 2));

//     // Parse and verify the webhook event
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     let data;
//     try {
//       data = await validateWebhookEventSignature(requestJson);
//       // Events are signed by the app key of a user with a JSON Farcaster Signature.
//     } catch (e: unknown) {
//       // Handle verification errors (invalid data, invalid app key, etc.)
//       // Return appropriate error responses with status codes 400, 401, or 500
//       console.error("Webhook validation error:", e);
//       const errorMessage = e instanceof Error ? e.message : String(e);

//       if (errorMessage.includes("Missing header or payload")) {
//         return Response.json(
//           { success: false, error: "Invalid webhook format" },
//           { status: 400 }
//         );
//       }

//       if (
//         errorMessage.includes("Invalid header data") ||
//         errorMessage.includes("Invalid payload")
//       ) {
//         return Response.json(
//           { success: false, error: "Invalid webhook data" },
//           { status: 400 }
//         );
//       }

//       return Response.json(
//         { success: false, error: "Webhook validation failed" },
//         { status: 401 }
//       );
//     }

//     const fid = data.fid;
//     const event = data.event;

//     console.log("Processing event:", event.event, "for FID:", fid);

//     // Handle different event types
//     switch (event.event) {
//       case "frame_added":
//         console.log(
//           "Processing frame_added event",
//           event.notificationDetails as FrameNotificationDetails
//         );
//         await setUserNotificationDetails(
//           fid,
//           event.notificationDetails as FrameNotificationDetails
//         );
//         break;

//       case "frame_removed":
//         console.log("Processing frame_removed event");
//         try {
//           await deleteUserNotificationDetails(fid);
//           // Remove notification token from miniapp_user
//           await prisma.miniapp_user.updateMany({
//             where: { farcaster_id: fid.toString() },
//             data: {
//               notification_token: null,
//               updated_at: new Date(),
//             },
//           });
//           console.log("Successfully processed frame_removed");
//         } catch (error) {
//           console.error("Error processing frame_removed:", error);
//           throw error;
//         }
//         break;

//       case "notifications_enabled":
//         console.log(
//           "Processing notifications_enabled event",
//           event.notificationDetails as FrameNotificationDetails
//         );
//         console.log(
//           "Raw event.notificationDetails:",
//           JSON.stringify(event.notificationDetails, null, 2)
//         );
//         console.log("Full event object:", JSON.stringify(event, null, 2));
//         try {
//           // The event object contains notificationDetails, so we need to pass just that part
//           await setUserNotificationDetails(
//             fid,
//             event.notificationDetails as FrameNotificationDetails
//           );

//           // await sendFrameNotification({
//           //   fid,
//           //   title: `Welcome to ${appName}`,
//           //   body: `Thank you for enabling notifications for ${appName}`,
//           //   notificationDetails: event.notificationDetails,
//           // });
//           console.log("Successfully processed notifications_enabled");
//         } catch (error) {
//           console.error("Error processing notifications_enabled:", error);
//           throw error;
//         }
//         break;

//       case "notifications_disabled":
//         console.log("Processing notifications_disabled event");
//         try {
//           await deleteUserNotificationDetails(fid);
//           // Remove notification token from miniapp_user
//           await prisma.miniapp_user.updateMany({
//             where: { farcaster_id: fid.toString() },
//             data: {
//               notification_token: null,
//               updated_at: new Date(),
//             },
//           });
//           console.log("Successfully processed notifications_disabled");
//         } catch (error) {
//           console.error("Error processing notifications_disabled:", error);
//           throw error;
//         }
//         break;

//       default:
//         console.warn("Unknown event type:", event.event);
//         break;
//     }

//     console.log("Webhook processing completed successfully");
//     return Response.json({ success: true });
//   } catch (error) {
//     console.error("Webhook processing failed:", {
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//     });

//     return Response.json(
//       {
//         success: false,
//         error: "Internal server error",
//         details: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Hello, world!" });
}
