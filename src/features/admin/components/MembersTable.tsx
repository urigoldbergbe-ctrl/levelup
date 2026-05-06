'use client'

import { useState, useTransition } from 'react'
import { assignDirectReportAction, removeDirectReportAction, setMemberRoleAction } from '../actions/managerAssignments'

interface MemberUser { id: string; email: string }

interface Props {
  orgId: string
  memberUsers: MemberUser[]
  roleMap: Record<string, string>
  reportCountMap: Record<string, number>
  allAssignments: Array<{ manager_id: string; employee_id: string }>
}

const ASSIGNABLE_ROLES = ['member', 'manager', 'hr_admin'] as const

const ROLE_STYLE: Record<string, string> = {
  owner:    'bg-mckinsey-blue/10 text-mckinsey-blue',
  hr_admin: 'bg-violet/10 text-violet',
  manager:  'bg-mckinsey-teal/10 text-mckinsey-teal',
  member:   'bg-mist text-ink-mid',
}

export default function MembersTable({ orgId, memberUsers, roleMap, reportCountMap, allAssignments }: Props) {
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const managers = memberUsers.filter(u => roleMap[u.id] === 'manager')
  const nonManagers = memberUsers.filter(u => roleMap[u.id] !== 'manager' && roleMap[u.id] !== 'owner' && roleMap[u.id] !== 'hr_admin')

  function isAssigned(managerId: string, employeeId: string) {
    return allAssignments.some(a => a.manager_id === managerId && a.employee_id === employeeId)
  }

  function toggleAssignment(managerId: string, employeeId: string) {
    startTransition(async () => {
      try {
        if (isAssigned(managerId, employeeId)) {
          await removeDirectReportAction(orgId, managerId, employeeId)
        } else {
          await assignDirectReportAction(orgId, managerId, employeeId)
        }
      } catch (e) {
        console.error(e)
        window.alert(e instanceof Error ? e.message : 'Could not update assignment.')
      }
    })
  }

  function changeRole(userId: string, role: string) {
    startTransition(async () => {
      try {
        await setMemberRoleAction(orgId, userId, role)
      } catch (e) {
        console.error(e)
        window.alert(e instanceof Error ? e.message : 'Could not update role.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Members table */}
      <div className="bg-white border border-black/[0.07] overflow-hidden rounded-sm">
        <div className="px-6 py-3 border-b border-black/[0.07] bg-mist/60 flex items-center justify-between">
          <h2 className="font-body text-xs font-600 uppercase tracking-widest text-ink-mid">All Members</h2>
          <p className="font-body text-xs text-ink-faint">{memberUsers.length} total</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.05]">
              <th className="px-6 py-3 text-left text-xs font-body font-600 text-ink-mid uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-body font-600 text-ink-mid uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-body font-600 text-ink-mid uppercase tracking-wider">Direct reports</th>
              <th className="px-6 py-3 text-left text-xs font-body font-600 text-ink-mid uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberUsers.map(u => {
              const role = roleMap[u.id] ?? 'member'
              const reports = reportCountMap[u.id] ?? 0
              return (
                <tr key={u.id} className="border-b border-black/[0.04] last:border-0 hover:bg-mist/30 transition-colors">
                  <td className="px-6 py-4 font-body text-sm text-ink">{u.email}</td>
                  <td className="px-6 py-4">
                    {role === 'owner' ? (
                      <span className={`text-xs font-body font-600 px-2.5 py-1 rounded-full ${ROLE_STYLE.owner}`}>
                        Owner
                      </span>
                    ) : (
                    <select
                      value={role}
                      onChange={e => changeRole(u.id, e.target.value)}
                      disabled={isPending}
                      className={`text-xs font-body font-600 px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mckinsey-blue/20 ${ROLE_STYLE[role] ?? ROLE_STYLE.member}`}
                    >
                      {ASSIGNABLE_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {role === 'manager' ? (
                      <button
                        onClick={() => setSelectedManager(selectedManager === u.id ? null : u.id)}
                        className="text-xs text-mckinsey-blue hover:underline"
                      >
                        {reports} report{reports !== 1 ? 's' : ''} {selectedManager === u.id ? '▲' : '▼'}
                      </button>
                    ) : (
                      <span className="text-xs text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {role === 'manager' && (
                      <button
                        onClick={() => setSelectedManager(selectedManager === u.id ? null : u.id)}
                        className="text-xs text-mckinsey-blue hover:underline"
                      >
                        Manage team
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Direct reports assignment panel */}
      {selectedManager && (
        <div className="bg-white border border-mckinsey-blue/20 rounded-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-mckinsey-blue/10 bg-mckinsey-light/50 flex items-center justify-between">
            <div>
              <h3 className="font-body text-sm font-600 text-ink">
                Direct reports for <span className="text-mckinsey-blue">{memberUsers.find(u => u.id === selectedManager)?.email}</span>
              </h3>
              <p className="font-body text-xs text-ink-mid mt-0.5">Check the employees who report to this manager</p>
            </div>
            <button onClick={() => setSelectedManager(null)} className="text-ink-faint hover:text-ink text-sm">✕</button>
          </div>
          <div className="p-4 grid sm:grid-cols-2 gap-2">
            {nonManagers.map(emp => (
              <label
                key={emp.id}
                className="flex items-center gap-3 p-3 rounded border border-black/[0.06] hover:border-mckinsey-blue/20 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#002F6C] cursor-pointer"
                  checked={isAssigned(selectedManager, emp.id)}
                  disabled={isPending}
                  onChange={() => toggleAssignment(selectedManager, emp.id)}
                />
                <span className="font-body text-sm text-ink">{emp.email}</span>
              </label>
            ))}
            {nonManagers.length === 0 && (
              <p className="text-sm text-ink-faint col-span-2 py-4 text-center">No regular members to assign.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
