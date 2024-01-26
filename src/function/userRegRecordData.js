import getIpAddress from "./getIpAddress.js";

const userAgentData = navigator.userAgentData;

// processType: SIGNUP, LOGIN, LOGOUT
const userRegRecordData = (processType) => {
	return getIpAddress().then(res => {
    return {
        ip: res,
        timestemp: Date.now(),
        platform: userAgentData.platform,
        mobile: userAgentData.mobile,
        brand: userAgentData.brands[1].brand,
        process: processType,
      };
  });
}

export default userRegRecordData;