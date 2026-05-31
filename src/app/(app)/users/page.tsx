"use client"
export default function UsersPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage platform users and role assignments</p>
      </div>
      <div className="card" style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Use the default users seeded by the seed script.<br />
          Full CRUD user management is a future enhancement.
        </p>
        <div style={{ marginTop: 24, fontSize: 13, color: "var(--text-secondary)" }}>
          <strong>Default users:</strong><br />
          admin@college.edu · principal@college.edu · hod.cse@college.edu (and ECE, MECH, CIVIL)
        </div>
      </div>
    </>
  )
}
