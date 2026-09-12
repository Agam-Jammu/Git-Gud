package com.gitgud.seed;

import com.gitgud.model.Question;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebCloudQuestions extends QuestionCategory {

    public static final String CATEGORY = "Web & Cloud Architecture";

    @Override
    public String category() {
        return CATEGORY;
    }

    @Override
    public List<Question> questions() {
        return List.of(
                question(
                        "An HTTP 403 response means...",
                        List.of("Authentication is required",
                                "The client is authenticated but not authorized",
                                "The resource was not found",
                                "The server crashed"),
                        1,
                        "401 means unauthenticated; 403 means the identity is known but lacks permission."),
                question(
                        "Which HTTP method is expected to be idempotent?",
                        List.of("POST", "PUT", "PATCH", "CONNECT"),
                        1,
                        "PUT is idempotent: repeating the same request yields the same server state."),
                question(
                        "In the CAP theorem, during a network partition a system must choose between...",
                        List.of("Consistency and Availability",
                                "Latency and Throughput",
                                "Security and Scalability",
                                "Caching and Durability"),
                        0,
                        "When a partition occurs you either refuse requests (CP) or serve possibly stale data (AP)."),
                question(
                        "An HTTP 201 response indicates...",
                        List.of("OK", "Created", "No Content", "Accepted"),
                        1,
                        "201 Created is returned when a new resource is created, often with a Location header."),
                question(
                        "A REST API being stateless means...",
                        List.of("It cannot use a database",
                                "Each request carries all context needed to process it",
                                "Sessions are stored only server-side",
                                "It must use HTTP/2"),
                        1,
                        "No client session state is kept on the server between requests."),
                question(
                        "An L7 load balancer routes requests based on...",
                        List.of("IP address and port only",
                                "Application-layer data such as HTTP paths and headers",
                                "MAC address",
                                "TCP sequence numbers"),
                        1,
                        "Layer 7 balances on HTTP content; Layer 4 sees only transport-level information."),
                question(
                        "Which response header tells clients how long a response may be cached?",
                        List.of("Cache-Control: max-age", "ETag", "Content-Length", "Connection"),
                        0,
                        "Cache-Control: max-age sets the freshness lifetime in seconds."),
                question(
                        "GCP Cloud Run is best described as...",
                        List.of("A virtual machine service",
                                "A managed serverless container platform",
                                "A Kubernetes control plane",
                                "A block storage service"),
                        1,
                        "Cloud Run runs stateless containers on demand, scaling to zero when idle."),
                question(
                        "Horizontal scaling means...",
                        List.of("Adding more machines", "Adding CPU and RAM to one machine", "Rewriting the application", "Using a larger disk"),
                        0,
                        "Horizontal (scale out) adds instances; vertical (scale up) adds resources to one instance."),
                question(
                        "CORS is enforced by...",
                        List.of("The server", "The browser", "The network router", "The operating system"),
                        1,
                        "The browser blocks cross-origin responses unless the server sends matching CORS headers.")
        );
    }
}
