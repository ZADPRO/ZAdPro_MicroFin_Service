const Label = {
  refUserFname: "First Name",
  refUserLname: "Last Name",
  refUserDOB: "Date of Birth",
  refAadharNo: "Aadhar Number",
  refPanNo: "PAN Number",
  refUserRole: "Role Type",
  refActiveStatus: "ActiveStatus",
  refUserProfile: "Profile Image",
  refPanPath: "PAN Image",
  refAadharPath: "Aadhar Image",
  refUserMobileNo: "Mobile Number",
  refUserEmail: "Email",
  refUserAddress: "Address",
  refUserDistrict: "District",
  refUserState: "State",
  refUserPincode: "Pincode",
};

export function reLabelText(key: string): string {
  console.log("key line ----- 21", key);

  return Label[key as keyof typeof Label] || "Label not found";
}
