import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "escrow_projects.json")

function readProjects(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]))
      return []
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
  } catch {
    return []
  }
}

function writeProjects(data: any[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  const projects = readProjects()
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
      const projects = readProjects()
      projects.push(project)
      writeProjects(projects)
      return NextResponse.json(project)
    }

    if (action === "update") {
      const { project } = body
      if (!project || !project.id) {
        return NextResponse.json({ error: "Missing project data or id." }, { status: 400 })
      }
      const projects = readProjects()
      const index = projects.findIndex((p: any) => p.id === project.id)
      if (index === -1) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 })
      }
      projects[index] = project
      writeProjects(projects)
      return NextResponse.json(project)
    }

    if (action === "save_all") {
      const { projects } = body
      if (!Array.isArray(projects)) {
        return NextResponse.json({ error: "Missing projects array." }, { status: 400 })
      }
      writeProjects(projects)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}
