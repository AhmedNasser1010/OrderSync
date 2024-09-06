function askNotificationPermission() {
	if (!("Notification" in window)) {
		console.log("This browser does not support notifications.");
		return;
	}
	Notification.requestPermission();
}

const pushNotification = (data) => {
	Notification.permission !== "granted" && askNotificationPermission();

	if ("Notification" in window && Notification.permission === "granted") {
		navigator.serviceWorker.ready.then(registration => {

			registration.showNotification(data?.title, {
				...data,
				body: data?.body ?? "",
				icon: data?.icon ?? "../../public/assets/icon-144.png",
				vibrate: [200, 100, 200, 100, 200, 100, 200],
			});

		})
	}

	navigator.setAppBadge(1)
};

export default pushNotification;
