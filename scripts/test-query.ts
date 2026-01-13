
import { getTeamMembers, getDepartments } from "../lib/sanity";

async function test() {
  const departments = await getDepartments();
  const teamMembers = await getTeamMembers();

  console.log("DEPARTMENTS:", JSON.stringify(departments, null, 2));
  console.log("TEAM MEMBERS:", JSON.stringify(teamMembers.slice(0, 5), null, 2));
  
  const membersByDepartment = departments
    .map(dept => ({
      name: dept.name,
      _id: dept._id,
      memberCount: teamMembers.filter((m: any) => m.department?._id === dept._id).length
    }));
    
  console.log("MEMBERS BY DEPT:", JSON.stringify(membersByDepartment, null, 2));
}

test().catch(console.error);
