import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;

        // In a real implementation, delete automation rule from database
        console.log(`Deleting automation rule ${id}`);

        return NextResponse.json({
            success: true,
            message: "Automation rule deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting automation rule:", error);
        return NextResponse.json(
            { error: "Failed to delete automation rule" },
            { status: 500 },
        );
    }
}
