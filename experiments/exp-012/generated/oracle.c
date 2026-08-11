/* Independent CJS-F2W oracle. Compiled against the pinned official CUDA 13.3 Windows header. */
#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#else
#include <dlfcn.h>
#endif
#include <cuda.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>

typedef struct ProcCase {
    const char *publicName;
    const char *nativeName;
} ProcCase;

static void print_value(const char *name, int value) {
    printf("VALUE\t%s\t%d\n", name, value);
}

static void print_query(const char *name, CUresult result, CUdriverProcAddressQueryResult status, void *pointer) {
    printf("NEG\t%s\t%d\t%d\t%d\n", name, (int)result, (int)status, pointer != NULL ? 1 : 0);
}

int main(void) {
    const ProcCase procedures[] = {
        {"cuCtxCreate", "cuCtxCreate_v4"},
        {"cuCtxDestroy", "cuCtxDestroy_v2"},
        {"cuCtxGetCurrent", "cuCtxGetCurrent"},
        {"cuCtxSetCurrent", "cuCtxSetCurrent"},
        {"cuDeviceGet", "cuDeviceGet"},
        {"cuDeviceGetAttribute", "cuDeviceGetAttribute"},
        {"cuDeviceGetCount", "cuDeviceGetCount"},
        {"cuDriverGetVersion", "cuDriverGetVersion"},
        {"cuGetErrorName", "cuGetErrorName"},
        {"cuGetErrorString", "cuGetErrorString"},
        {"cuGetProcAddress", "cuGetProcAddress_v2"},
        {"cuInit", "cuInit"}
    };
    const struct AttributeCase {
        const char *name;
        CUdevice_attribute attribute;
    } attributes[] = {
        {"maxThreadsPerBlock", CU_DEVICE_ATTRIBUTE_MAX_THREADS_PER_BLOCK},
        {"multiprocessorCount", CU_DEVICE_ATTRIBUTE_MULTIPROCESSOR_COUNT},
        {"computeCapabilityMajor", CU_DEVICE_ATTRIBUTE_COMPUTE_CAPABILITY_MAJOR},
        {"computeCapabilityMinor", CU_DEVICE_ATTRIBUTE_COMPUTE_CAPABILITY_MINOR}
    };
    CUresult result;
    int value = 0;
    int deviceCount = 0;
    CUdevice device = -1;

    print_value("invalidInitFlagsStatus", (int)cuInit(1));
    result = cuInit(0);
    print_value("initStatus", (int)result);
    if (result != CUDA_SUCCESS) return 2;

    result = cuDriverGetVersion(&value);
    printf("DRIVER\t%d\t%d\n", (int)result, value);

    result = cuDeviceGetCount(&deviceCount);
    printf("DEVICE_COUNT\t%d\t%d\n", (int)result, deviceCount);
    if (result != CUDA_SUCCESS || deviceCount < 1) return 3;

    result = cuDeviceGet(&device, 0);
    printf("DEVICE\t%d\t%d\t%d\n", (int)result, 0, (int)device);
    if (result != CUDA_SUCCESS) return 4;

    for (size_t index = 0; index < sizeof(attributes) / sizeof(attributes[0]); index++) {
        value = 0;
        result = cuDeviceGetAttribute(&value, attributes[index].attribute, device);
        printf("ATTR\t%s\t%d\t%d\n", attributes[index].name, (int)result, value);
    }

    {
        const char *errorName = NULL;
        const char *errorString = NULL;
        CUresult nameResult = cuGetErrorName(CUDA_SUCCESS, &errorName);
        CUresult stringResult = cuGetErrorString(CUDA_SUCCESS, &errorString);
        printf("ERROR\tname\t%d\t%s\n", (int)nameResult, errorName != NULL ? errorName : "<null>");
        printf("ERROR\tdescription\t%d\t%s\n", (int)stringResult, errorString != NULL ? errorString : "<null>");
    }

    {
#if defined(_WIN32)
        HMODULE driver = GetModuleHandleW(L"nvcuda.dll");
#else
        void *driver = dlopen("libcuda.so.1", RTLD_LAZY | RTLD_LOCAL);
#endif
        for (size_t index = 0; index < sizeof(procedures) / sizeof(procedures[0]); index++) {
            void *pointer = NULL;
            CUdriverProcAddressQueryResult status = CU_GET_PROC_ADDRESS_SYMBOL_NOT_FOUND;
#if defined(_WIN32)
            FARPROC namedExport;
#else
            void *namedExport;
#endif
            result = cuGetProcAddress(
                procedures[index].publicName,
                &pointer,
                CUDA_VERSION,
                CU_GET_PROC_ADDRESS_DEFAULT,
                &status
            );
#if defined(_WIN32)
            namedExport = driver != NULL ? GetProcAddress(driver, procedures[index].nativeName) : NULL;
#else
            namedExport = driver != NULL ? dlsym(driver, procedures[index].nativeName) : NULL;
#endif
            printf(
                "PROC\t%s\t%s\t%d\t%d\t%d\t%d\t%d\n",
                procedures[index].publicName,
                procedures[index].nativeName,
                (int)result,
                (int)status,
                pointer != NULL ? 1 : 0,
                namedExport != NULL ? 1 : 0,
                pointer != NULL && namedExport != NULL && (uintptr_t)pointer == (uintptr_t)namedExport ? 1 : 0
            );
        }

        {
            void *pointer = NULL;
            CUdriverProcAddressQueryResult status = CU_GET_PROC_ADDRESS_SUCCESS;
            result = cuGetProcAddress("cudaJsDefinitelyMissing", &pointer, CUDA_VERSION, CU_GET_PROC_ADDRESS_DEFAULT, &status);
            print_query("missingSymbol", result, status, pointer);
        }
        {
            void *pointer = NULL;
            CUdriverProcAddressQueryResult status = CU_GET_PROC_ADDRESS_SUCCESS;
            result = cuGetProcAddress("cuInit", &pointer, 1, CU_GET_PROC_ADDRESS_DEFAULT, &status);
            print_query("insufficientVersion", result, status, pointer);
        }
        {
            void *pointer = NULL;
            CUdriverProcAddressQueryResult status = CU_GET_PROC_ADDRESS_SUCCESS;
            result = cuGetProcAddress("cuCtxCreate_v4", &pointer, CUDA_VERSION, CU_GET_PROC_ADDRESS_DEFAULT, &status);
            print_query("versionedQueryName", result, status, pointer);
        }
#if !defined(_WIN32)
        if (driver != NULL) dlclose(driver);
#endif
    }

    {
        CUctxCreateParams parameters;
        CUcontext context = NULL;
        CUcontext current = NULL;
        memset(&parameters, 0, sizeof(parameters));

        result = cuCtxCreate(&context, &parameters, 0, device);
        printf("CONTEXT\tcreate\t%d\t%d\n", (int)result, context != NULL ? 1 : 0);
        if (result != CUDA_SUCCESS || context == NULL) return 5;

        result = cuCtxGetCurrent(&current);
        printf("CONTEXT\tgetCurrent\t%d\t%d\n", (int)result, current == context ? 1 : 0);

        result = cuCtxSetCurrent(NULL);
        printf("CONTEXT\tclear\t%d\t1\n", (int)result);
        current = (CUcontext)(uintptr_t)1;
        result = cuCtxGetCurrent(&current);
        printf("CONTEXT\tgetAfterClear\t%d\t%d\n", (int)result, current == NULL ? 1 : 0);

        result = cuCtxSetCurrent(context);
        printf("CONTEXT\trestore\t%d\t1\n", (int)result);
        current = NULL;
        result = cuCtxGetCurrent(&current);
        printf("CONTEXT\tgetAfterRestore\t%d\t%d\n", (int)result, current == context ? 1 : 0);

        result = cuCtxDestroy(context);
        printf("CONTEXT\tdestroy\t%d\t1\n", (int)result);
        context = NULL;
        current = (CUcontext)(uintptr_t)1;
        result = cuCtxGetCurrent(&current);
        printf("CONTEXT\tgetAfterDestroy\t%d\t%d\n", (int)result, current == NULL ? 1 : 0);
    }

    return 0;
}
