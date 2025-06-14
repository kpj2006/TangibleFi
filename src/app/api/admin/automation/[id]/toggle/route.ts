import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const body = await request.json();
        const { id } = params;
        const { status } = body;

        // In a real implementation, update automation rule status in database
        console.log(`Toggling automation rule ${id} to status: ${status}`);

        return NextResponse.json({
            success: true,
            message: `Automation rule ${
                status === "active" ? "activated" : "paused"
            } successfully`,
        });
    } catch (error) {
        console.error("Error toggling automation rule:", error);
        return NextResponse.json(
            { error: "Failed to toggle automation rule" },
            { status: 500 },
        );
    }
}
