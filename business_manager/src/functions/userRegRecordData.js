import getIpAddress from "./getIpAddress.js";

const userAgentData = navigator.userAgentData;

const userRegRecordData = (processType) => {
	return getIpAddress().then(res => {
    return {
        ip: res,
        timestemp: String(Date.now()),
        platform: userAgentData.platform,
        mobile: userAgentData.mobile,
        brand: userAgentData.brands[1].brand,
        process: processType,
      };
  });
}

export default userRegRecordData;