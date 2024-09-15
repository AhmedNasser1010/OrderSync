type UseCloseDay = () => void

const useCloseDay = (): UseCloseDay => {

  const closeDay = () => {
    console.log("Close The Day Triggered")
  }

  return closeDay
}

export default useCloseDay