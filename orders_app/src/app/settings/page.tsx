"use client";

import Page from "@/components/Page";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAuth from '@/hooks/useAuth'

import NavBar from './NavBar'
import DisplaySettings from './DisplaySettings'
import ProfileAndLang from './ProfileAndLang'
import OrderWorkflow from './OrderWorkflow'
import Themes from './Themes'

export default function SettingsPage() {
	const { logout } = useAuth()
	return (
		<Page>
			<NavBar />

			<div className="grid gap-6 md:grid-cols-2">
				<ProfileAndLang />
				<DisplaySettings />
				<OrderWorkflow />
				<Themes />
			</div>

			<div className="mt-8">
				<Button variant="destructive" className="w-full" onClick={logout}>
					<LogOut className="mr-2 h-4 w-4" /> Logout
				</Button>
			</div>
		</Page>
	);
}
