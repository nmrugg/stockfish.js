#include <emscripten.h>
#include <string>

EM_JS(const char*, emscripten_utils_getline_impl, (), {
  const toHeap = (js_str) => {
    const num_bytes = lengthBytesUTF8(js_str) + 1;
    const ptr = _malloc(num_bytes);
    stringToUTF8(js_str, ptr, num_bytes);
    return ptr;
  };

  return Asyncify.handleAsync(async () => {
    const command = await Module["queue"].get();
    return toHeap(command);
  });
});

void emscripten_utils_getline(std::string& result) {
  const char* ptr = emscripten_utils_getline_impl();
  result = ptr;
  std::free((void*)ptr);
}
