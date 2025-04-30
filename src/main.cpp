#include <string>

#include <SparkWeaverCore.h>
#include <emscripten/bind.h>

struct NodeParamBindable {
    std::string name;
    uint16_t    min{};
    uint16_t    max{};
    uint16_t    default_value{};
};

struct NodeConfigBindable {
    std::string                    title;
    std::string                    name;
    std::vector<NodeParamBindable> params{};
    uint8_t                        params_count{};
    uint8_t                        max_color_inputs{};
    uint8_t                        max_trigger_inputs{};
    bool                           enable_color_outputs{};
    bool                           enable_trigger_outputs{};
};

std::vector<NodeConfigBindable> getNodeConfigs()
{
    std::vector<NodeConfigBindable> configs;
    for (const auto& config : SparkWeaverCore::getNodeConfigs()) {
        std::vector<NodeParamBindable> params;
        for (const auto& param : config.params) {
            params.push_back({std::string(param.name.data()), param.min, param.max, param.default_value});
        }

        configs.push_back(
            {std::string(config.title.data()),
             std::string(config.name.data()),
             std::move(params),
             config.params_count,
             config.max_color_inputs,
             config.max_trigger_inputs,
             config.enable_color_outputs,
             config.enable_trigger_outputs});
    }
    return configs;
}

static SparkWeaverCore::Builder builder;

std::string build(const std::string& tree)
{
    try {
        builder.build(tree);
        return "OK";
    } catch (const std::exception& e) {
        return e.what();
    }
}

emscripten::val tick()
{
    const auto p_data = builder.tick();
    return emscripten::val(emscripten::typed_memory_view(513, p_data));
}

EMSCRIPTEN_BINDINGS(node_config)
{
    emscripten::value_object<NodeParamBindable>("NodeParamBindable")
        .field("name", &NodeParamBindable::name)
        .field("min", &NodeParamBindable::min)
        .field("max", &NodeParamBindable::max)
        .field("default_value", &NodeParamBindable::default_value);
    emscripten::register_vector<NodeParamBindable>("NodeParamVector");

    emscripten::value_object<NodeConfigBindable>("NodeConfigBindable")
        .field("title", &NodeConfigBindable::title)
        .field("name", &NodeConfigBindable::name)
        .field("params", &NodeConfigBindable::params)
        .field("params_count", &NodeConfigBindable::params_count)
        .field("max_color_inputs", &NodeConfigBindable::max_color_inputs)
        .field("max_trigger_inputs", &NodeConfigBindable::max_trigger_inputs)
        .field("enable_color_outputs", &NodeConfigBindable::enable_color_outputs)
        .field("enable_trigger_outputs", &NodeConfigBindable::enable_trigger_outputs);
    emscripten::register_vector<NodeConfigBindable>("NodeConfigVector");

    emscripten::function("getNodeConfigs", &getNodeConfigs);
    emscripten::function("build", &build);
    emscripten::function("tick", &tick);
}
