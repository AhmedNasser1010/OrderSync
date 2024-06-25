const useVerifyOtp = () => {
	const verifyOtp = async (otp) => {
		try {
      if (otp.length === 6) {
        let confirmationResult = window.confirmationResult
        const user = confirmationResult.confirm(otp).then(result => {
          let user = result.user
          return user
        }).catch(err => {
          console.log(err)
        })
        return user
      }
    } catch(err) {
      console.log(err)
    }
	}

	return verifyOtp
}

export default useVerifyOtp