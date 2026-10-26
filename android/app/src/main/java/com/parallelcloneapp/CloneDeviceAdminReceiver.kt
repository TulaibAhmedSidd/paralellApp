package com.parallelcloneapp

import android.app.admin.DeviceAdminReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.Toast

class CloneDeviceAdminReceiver : DeviceAdminReceiver() {

    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        super.onProfileProvisioningComplete(context, intent)
        val manager = getManager(context)
        val componentName = getWho(context)
        manager.setProfileName(componentName, "Parallel Space")
        manager.setProfileEnabled(componentName)
        Toast.makeText(context, "Parallel Space Profile Provisioned Successfully!", Toast.LENGTH_SHORT).show()
    }

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Toast.makeText(context, "Parallel Space Engine Activated", Toast.LENGTH_SHORT).show()
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Toast.makeText(context, "Parallel Space Engine Deactivated", Toast.LENGTH_SHORT).show()
    }

    companion object {
        fun getComponentName(context: Context): ComponentName {
            return ComponentName(context.applicationContext, CloneDeviceAdminReceiver::class.java)
        }
    }
}
