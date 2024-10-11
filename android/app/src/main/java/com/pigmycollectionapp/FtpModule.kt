package com.pigmycollectionapp

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import org.apache.commons.net.ftp.FTP
import org.apache.commons.net.ftp.FTPClient
import java.io.ByteArrayOutputStream
import java.io.IOException

class FtpModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FtpModule"
    }

    @ReactMethod
    fun getFileContent(server: String, port: Int, user: String, pass: String, remoteFile: String, promise: Promise) {
        val ftpClient = FTPClient()
        val outputStream = ByteArrayOutputStream()

        try {
            ftpClient.connect(server, port)
            val success = ftpClient.login(user, pass)
            if (!success) {
                promise.reject("LOGIN_FAILED", "Could not login to the FTP server")
                return
            }
            ftpClient.enterLocalPassiveMode()
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE)

            val done = ftpClient.retrieveFile(remoteFile, outputStream)
            if (done) {
                val fileContent = String(outputStream.toByteArray(), Charsets.UTF_8)
                promise.resolve(fileContent)
            } else {
                promise.reject("DOWNLOAD_FAILED", "Failed to retrieve file content")
            }
        } catch (ex: Exception) {
            promise.reject("ERROR", ex.toString())
        } finally {
            try {
                if (ftpClient.isConnected) {
                    ftpClient.logout()
                    ftpClient.disconnect()
                }
            } catch (ex: IOException) {
                Log.e("FtpModule", "Error disconnecting", ex)
            }
            try {
                outputStream.close()
            } catch (ex: IOException) {
                Log.e("FtpModule", "Error closing output stream", ex)
            }
        }
    }
}