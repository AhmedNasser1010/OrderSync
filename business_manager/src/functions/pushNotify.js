function askNotificationPermission() {
	if (!("Notification" in window)) {
		console.log("This browser does not support notifications.");
		return;
	}
	Notification.requestPermission();
}

const pushNotification = (data) => {
	Notification.permission !== "granted" && askNotificationPermission();

	const n = new Notification(data?.title, {
		...data,
		body: data?.body ?? "",
		icon: data?.icon ?? "../../public/assets/icon-144.png",
		vibrate: data?.vibrate ?? true,
	});

	navigator.setAppBadge(1)
};

export default pushNotification;
