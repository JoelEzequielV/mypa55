package io.ionic.starter

import android.service.autofill.AutofillService
import android.service.autofill.FillRequest
import android.service.autofill.FillResponse
import android.service.autofill.Dataset
import android.widget.RemoteViews
import android.util.Log

class SecureVaultAutofillService : AutofillService() {

    override fun onFillRequest(
        request: FillRequest,
        cancellationSignal: android.os.CancellationSignal,
        callback: FillCallback
    ) {

        try {

            val presentation = RemoteViews(packageName, android.R.layout.simple_list_item_1)
            presentation.setTextViewText(android.R.id.text1,"Autocompletar con SecureVault")

            val dataset = Dataset.Builder(presentation).build()

            val response = FillResponse.Builder()
                .addDataset(dataset)
                .build()

            callback.onSuccess(response)

        } catch (e: Exception) {

            Log.e("SecureVault","Autofill error",e)
            callback.onFailure("Autofill error")

        }

    }

    override fun onSaveRequest(request: android.service.autofill.SaveRequest, callback: SaveCallback) {
        callback.onSuccess()
    }

}