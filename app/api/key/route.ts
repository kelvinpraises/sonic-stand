import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { pinata } from "@/services/pinata";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const uuid = uuidv4();
    const keyData = await pinata.keys.create({
      keyName: uuid.toString(),
      permissions: {
        endpoints: {
          data: {
            pinList: false,
            userPinnedDataTotal: false,
          },
          pinning: {
            pinFileToIPFS: true,
            pinJSONToIPFS: false,
            pinJobs: false,
            unpin: false,
            userPinPolicy: false,
          },
        },
      },
      maxUses: 1,
    });
    return NextResponse.json(keyData, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { text: "Error creating API Key:" },
      { status: 500 }
    );
  }
}
