import { type NextRequest, NextResponse } from "next/server"
import { readProjects, writeProjects, type EscrowProject } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const projects = await readProjects()
  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "create") {
      const { project } = body
      if (!project) {
        return NextResponse.json({ error: "Missing project data." }, { status: 400 })
      }
      const projects = await readProjects()
      projects.push(project)
      await writeProjects(projects)
      return NextResponse.json(project)
    }

    if (action === "update") {
      const { project } = body
      if (!project || !project.id) {
        return NextResponse.json({ error: "Missing project data or id." }, { status: 400 })
      }
      const projects = await readProjects()
      const index = projects.findIndex((p: any) => p.id === project.id)
      if (index === -1) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 })
      }
      projects[index] = project
      await writeProjects(projects)
      return NextResponse.json(project)
    }

    if (action === "save_all") {
      const { projects } = body
      if (!Array.isArray(projects)) {
        return NextResponse.json({ error: "Missing projects array." }, { status: 400 })
      }
      await writeProjects(projects)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  } catch (error) {
    console.error("Escrow POST error:", error)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}
